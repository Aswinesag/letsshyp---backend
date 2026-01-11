/**
Calculate Manhattan distance between two locations
Manhattan distance = |x1 - x2| + |y1 - y2|

@param {Object} location1
@param {Object} location2
@returns {number}
 */
function calculateManhattanDistance(location1, location2) {
    const latDiff = Math.abs(location1.lat - location2.lat);
    const lngDiff = Math.abs(location1.lng - location2.lng);
    const distanceInKm = (latDiff + lngDiff) * 111;
    return parseFloat(distanceInKm.toFixed(2));
}

/**
 * Calculate Euclidean distance between two locations (alternative)
@param {Object} location1 - { lat, lng }
@param {Object} location2 - { lat, lng }
@returns {number} Distance in kilometers
 */
function calculateEuclideanDistance(location1, location2) {
    const latDiff = location1.lat - location2.lat;
    const lngDiff = location1.lng - location2.lng;
    const distanceInKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
    return parseFloat(distanceInKm.toFixed(2));
}

/**
 * Find nearest location from a list of locations
@param {Object} sourceLocation - { lat, lng }
@param {Array} targetLocations - Array of objects with location property
@returns {Object} Nearest location with distance
 */
function findNearest(sourceLocation, targetLocations) {
    if (!targetLocations || targetLocations.length === 0) {
        return null;
    }

    let nearest = null;
    let minDistance = Infinity;

    targetLocations.forEach(target => {
        const distance = calculateManhattanDistance(sourceLocation, target.currentLocation);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = target;
        }
    });

    return {
        item: nearest,
        distance: minDistance
    };
}

const EXPRESS_MAX_DISTANCE_KM = 5;

module.exports = {
    calculateManhattanDistance,
    calculateEuclideanDistance,
    findNearest,
    EXPRESS_MAX_DISTANCE_KM
};