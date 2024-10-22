#!/bin/bash

# Output JSON file
output_file="../vids.json"

# Create an associative array to hold lists of videos by year
declare -A year_files_map

# Collect all .mp4 file names and organize them by year
for file in *.mp4; do
  if [[ -f "$file" ]]; then
    # Extract the year from the file name (assuming format YYYY-NN.mp4)
    year=${file:0:4}
    # Keep the full filename with extension for JSON output
    file_with_ext="./vids/$file"
    # Append the file (with .mp4) to the appropriate year in the array
    year_files_map[$year]+=",\"$file_with_ext\""
  fi
done

# Start JSON output
json_output="{"

# Build the JSON object
for year in "${!year_files_map[@]}"; do
  # Use slice to remove the leading comma
  file_list="[${year_files_map[$year]:1}]"
  json_output+="\"${year}\": $file_list,"
done

# Remove the trailing comma and close the JSON object
json_output="${json_output%,}}"

# Write to the JSON file
echo "$json_output" > "$output_file"

echo "JSON file with .mp4 file names by year has been created as $output_file"