export function getRandomBooleanWithChance(trueChance) {
  // Input validation: Ensure trueChance is a number between 0 and 100
  if (typeof trueChance !== 'number' || trueChance < 0 || trueChance > 100) {
    console.error("Error: trueChance must be a number between 0 and 100.");
    return false; // Or throw an error, depending on desired behavior for invalid input
  }

  // Generate a random number between 0 (inclusive) and 100 (exclusive)
  const randomNumber = Math.random() * 100 + 1; // Adding 1 to make it between 1 and 100

  // Return true if the random number is less than the trueChance, otherwise false
  return randomNumber <= trueChance;
}