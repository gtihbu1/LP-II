// Common auth functionality
// This file is mostly a placeholder - in a real app you'd have shared auth logic here
console.log("Auth utilities loaded");

// Example function - not used in the current implementation
function validatePassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return regex.test(password);
}