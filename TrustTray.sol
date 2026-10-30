// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TrustTray
 * @notice Permissionless peer-to-peer surplus food donation and claiming platform.
 *         Anyone can create a donation, anyone can claim an available donation,
 *         and pickup is confirmed by both the donor and the claimant.
 *         No admin verification is required to participate.
 */
contract TrustTray {
    // -------------------------------------------------------------------------
    // Types
    // -------------------------------------------------------------------------

    enum Status {
        Available,   // 0 — published and claimable
        Claimed,     // 1 — reserved by a claimant, awaiting physical pickup
        Completed,   // 2 — both parties confirmed the handover
        Cancelled    // 3 — donor withdrew the listing before it was claimed
    }

    struct Donation {
        uint256 id;
        string  foodName;
        string  description;
        uint256 quantity;
        address donor;
        string  pickupLocation;
        uint256 expiryTime;       // Unix timestamp: when the food itself expires
        uint256 pickupDeadline;   // Unix timestamp: latest time food can be collected
        Status  status;
        address claimedBy;
        bool    donorConfirmed;
        bool    claimantConfirmed;
    }

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    uint256 public nextDonationId = 1;
    mapping(uint256 => Donation) public donations;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event DonationCreated(
        uint256 indexed id,
        address indexed donor,
        string  foodName,
        uint256 quantity
    );
    event DonationClaimed(uint256 indexed id, address indexed claimant);
    event DonationCompleted(uint256 indexed id);
    event DonationCancelled(uint256 indexed id);
    event PickupConfirmed(uint256 indexed id, address indexed confirmer);

    // -------------------------------------------------------------------------
    // Write functions (all permissionless — no admin or verified-user gate)
    // -------------------------------------------------------------------------

    /**
     * @notice Publish a surplus food donation.
     * @param foodName        Human-readable food name.
     * @param description     Description, category, diet tags, allergens, etc.
     * @param quantity        Number of food packs / portions.
     * @param pickupLocation  Physical pickup address or area.
     * @param expiryTime      Unix timestamp when the food itself expires.
     *                        Must be >= pickupDeadline.
     * @param pickupDeadline  Unix timestamp by which the food must be collected.
     *                        Must be strictly in the future.
     * @return id             The newly assigned donation ID.
     */
    function createDonation(
        string calldata foodName,
        string calldata description,
        uint256 quantity,
        string calldata pickupLocation,
        uint256 expiryTime,
        uint256 pickupDeadline
    ) external returns (uint256) {
        require(bytes(foodName).length > 0,       "Food name required");
        require(bytes(pickupLocation).length > 0, "Pickup location required");
        require(quantity > 0,                     "Quantity must be positive");
        require(pickupDeadline > block.timestamp, "Pickup deadline must be future");
        require(expiryTime >= pickupDeadline,     "Expiry precedes pickup deadline");

        uint256 id = nextDonationId++;
        donations[id] = Donation({
            id:                id,
            foodName:          foodName,
            description:       description,
            quantity:          quantity,
            donor:             msg.sender,
            pickupLocation:    pickupLocation,
            expiryTime:        expiryTime,
            pickupDeadline:    pickupDeadline,
            status:            Status.Available,
            claimedBy:         address(0),
            donorConfirmed:    false,
            claimantConfirmed: false
        });

        emit DonationCreated(id, msg.sender, foodName, quantity);
        return id;
    }

    /**
     * @notice Claim an available donation.
     *         Atomically sets status to Claimed so only one caller can succeed.
     *         The donor cannot claim their own donation.
     * @param id  Donation ID to claim.
     */
    function claimDonation(uint256 id) external {
        Donation storage d = donations[id];
        require(d.id != 0,                            "Donation does not exist");
        require(d.status == Status.Available,         "Donation unavailable");
        require(msg.sender != d.donor,                "Donor cannot claim own donation");
        require(d.expiryTime > block.timestamp,       "Donation expired");
        require(d.pickupDeadline > block.timestamp,   "Pickup deadline passed");

        d.status    = Status.Claimed;
        d.claimedBy = msg.sender;
        emit DonationClaimed(id, msg.sender);
    }

    /**
     * @notice Confirm physical pickup — must be called by both donor and claimant.
     *         The donation is marked Completed only after both confirmations.
     * @param id  Donation ID.
     */
    function confirmPickup(uint256 id) external {
        Donation storage d = donations[id];
        require(d.id != 0,                    "Donation does not exist");
        require(d.status == Status.Claimed,   "Donation not claimed");

        if (msg.sender == d.donor) {
            require(!d.donorConfirmed,        "Donor already confirmed");
            d.donorConfirmed = true;
        } else if (msg.sender == d.claimedBy) {
            require(!d.claimantConfirmed,     "Claimant already confirmed");
            d.claimantConfirmed = true;
        } else {
            revert("Only donor or claimant can confirm");
        }

        emit PickupConfirmed(id, msg.sender);
        if (d.donorConfirmed && d.claimantConfirmed) {
            d.status = Status.Completed;
            emit DonationCompleted(id);
        }
    }

    /**
     * @notice Cancel an available donation — only the donor can do this.
     * @param id  Donation ID.
     */
    function cancelDonation(uint256 id) external {
        Donation storage d = donations[id];
        require(d.id != 0,                       "Donation does not exist");
        require(msg.sender == d.donor,           "Only donor can cancel");
        require(d.status == Status.Available,    "Donation not available");

        d.status = Status.Cancelled;
        emit DonationCancelled(id);
    }

    // -------------------------------------------------------------------------
    // View functions
    // -------------------------------------------------------------------------

    /**
     * @notice Return the full struct for a single donation.
     * @param id  Donation ID (must exist).
     */
    function getDonation(uint256 id) external view returns (Donation memory) {
        require(donations[id].id != 0, "Donation does not exist");
        return donations[id];
    }

    /**
     * @notice Return all donations ever created, in order from ID 1 to
     *         nextDonationId - 1. Slot 0 is always the zero-value struct
     *         (not a real donation) and is skipped.
     * @dev    Suitable for the current prototype scale. For large datasets,
     *         switch to event-based indexing or paginated reads.
     * @return all  Array of all Donation structs (length = nextDonationId - 1).
     */
    function getAllDonations() external view returns (Donation[] memory all) {
        uint256 count = nextDonationId - 1;
        all = new Donation[](count);
        for (uint256 i = 1; i <= count; i++) {
            all[i - 1] = donations[i];
        }
    }
}
