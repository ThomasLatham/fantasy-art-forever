#!/bin/bash

# Get the absolute path of the directory where the script is located
script_dir=$(dirname "$(realpath "${BASH_SOURCE[0]}")")

# Check if filename parameter is provided
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <filename>"
  exit 1
fi

filename="$1"

# Check if the file exists
if [ ! -f "$script_dir/$filename" ]; then
  echo "File not found!"
  exit 1
fi

# Initialize an empty result string
result=""

# Read the file line by line
while IFS= read -r line; do
  if [[ "$line" =~ subreddits:\ *\"([^\"]+)\" ]]; then
    # Extract the quoted content containing subreddit names
    quoted_content="${BASH_REMATCH[1]}"
    # Remove trailing comma if present
    quoted_content="${quoted_content%%,}"
    # Replace commas and spaces with just commas to have consistent formatting
    formatted_content="${quoted_content//, /,}"
    # Split the formatted content by commas to get individual subreddit names
    IFS=',' read -r -a names <<<"$formatted_content"
    # Loop through each name and construct the formatted string
    for name in "${names[@]}"; do
      # Trim leading and trailing spaces from the name
      trimmed_name="${name// /}"
      # Construct the formatted string and append it to the result
      result+="[/r/Imaginary${trimmed_name}](https://www.reddit.com/r/Imaginary${trimmed_name}), "
    done
    # Append a newline after processing each "subreddits: " line
    result+="\n"
  fi
done <"$script_dir/$filename"

# Remove the trailing comma and space
result=${result%, *}

# Output the formatted string to a file
echo -e "$result" >"$script_dir/linkified_subreddit_list.txt"

echo "Formatted output has been saved to linkified_subreddit_list.txt"

# Thanks ChatGPT

#Note: Have to single-line the subreddit lists in the input file ("ctrl+k ctrl+shift+s" to avoid
# format-on-save) in order to get everything right
