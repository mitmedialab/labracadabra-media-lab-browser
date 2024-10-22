#!/bin/bash

# Directory containing your files (Use '.' for the current directory)
DIR="."

# Loop through .mkv, .webm, and .mov files in the directory
for FILE in "$DIR"/*.{mkv,webm,mov}; do
  # Check if the file exists
  if [ -f "$FILE" ]; then
    # Get the filename without the extension
    BASENAME=$(basename "$FILE" | cut -d. -f1)
    
    # Convert the file to .mp4 format using ffmpeg
    ffmpeg -i "$FILE" -c:v libx264 -preset fast -c:a aac -b:a 192k "$DIR/$BASENAME.mp4"
    
    # Optional: Uncomment the next line if you want to delete the original file after conversion
    # rm "$FILE"
  fi
done