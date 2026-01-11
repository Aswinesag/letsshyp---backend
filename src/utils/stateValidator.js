// Valid state transitions
const VALID_TRANSITIONS = {
    'CREATED': ['ASSIGNED', 'CANCELLED'],
    'ASSIGNED': ['PICKED_UP', 'CANCELLED'],
    'PICKED_UP': ['IN_TRANSIT'],
    'IN_TRANSIT': ['DELIVERED'],
    'DELIVERED': [],
    'CANCELLED': []
};

// All valid states
const VALID_STATES = [
    'CREATED',
    'ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED'
];

/**
 * Check if a state transition is valid
 * 
 * @param {string} currentState - Current order state
 * @param {string} newState - Desired new state
 * @returns {boolean} True if transition is valid
 */
function canTransition(currentState, newState) {
    if (!VALID_STATES.includes(currentState)) {
        return false;
    }

    if (!VALID_STATES.includes(newState)) {
        return false;
    }

    return VALID_TRANSITIONS[currentState]?.includes(newState) || false;
}

/**
 * Get all valid next states for a given state
 * @param {string} currentState - Current order state
 * @returns {Array} Array of valid next states
 */
function getValidNextStates(currentState) {
    return VALID_TRANSITIONS[currentState] || [];
}

/**
 * Check if a state is terminal (no further transitions possible)
 * 
 * @param {string} state - Order state to check
 * @returns {boolean} True if state is terminal
 */
function isTerminalState(state) {
    return VALID_TRANSITIONS[state]?.length === 0;
}

/**
 * Validate if a state is a valid state
 * 
 * @param {string} state - State to validate
 * @returns {boolean} True if state is valid
 */
function isValidState(state) {
    return VALID_STATES.includes(state);
}

module.exports = {
    canTransition,
    getValidNextStates,
    isTerminalState,
    isValidState,
    VALID_TRANSITIONS,
    VALID_STATES
};