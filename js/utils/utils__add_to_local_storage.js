export function addEntry(entries) {
  // Parse the JSON stored in allEntries
  var existingEntries = JSON.parse(localStorage.getItem("allEntries"));
  if (existingEntries == null) existingEntries = [];

  // Save allEntries back to local storage
  existingEntries.push(entries);
  localStorage.setItem("allEntries", JSON.stringify(existingEntries));
  //   console.log(JSON.parse(localStorage.getItem("allEntries")));
}
