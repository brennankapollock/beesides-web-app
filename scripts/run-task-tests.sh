#!/bin/bash

# Script to run tests for a specific task and generate a report

# Check if task ID is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <task_id> [ui]"
  echo "Example: $0 1"
  echo "Example with UI: $0 1 ui"
  exit 1
fi

TASK_ID=$1
UI_MODE=$2
REPORT_DIR="test-results/task-$TASK_ID"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="$REPORT_DIR/report_$TIMESTAMP.md"

# Create report directory if it doesn't exist
mkdir -p "$REPORT_DIR"

# Determine if we should run in UI mode
PLAYWRIGHT_ARGS=""
if [ "$UI_MODE" = "ui" ]; then
  PLAYWRIGHT_ARGS="--ui"
fi

echo "Running tests for Task #$TASK_ID..."

# Run the tests and capture the output
TEST_OUTPUT=$(npx playwright test tests/tasks/$TASK_ID $PLAYWRIGHT_ARGS 2>&1)
TEST_EXIT_CODE=$?

# Create the report
cat > "$REPORT_FILE" << EOL
# Task #$TASK_ID Test Report

**Date:** $(date)

## Test Results

\`\`\`
$TEST_OUTPUT
\`\`\`

## Summary

EOL

# Add summary based on exit code
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All tests passed!" >> "$REPORT_FILE"
else
  echo "❌ Some tests failed. See output above for details." >> "$REPORT_FILE"
fi

# Add task details
echo -e "\n## Task Details\n" >> "$REPORT_FILE"

# Get task details from the tasks.json file
TASK_DETAILS=$(node -e "
  const fs = require('fs');
  const path = require('path');
  const tasksFile = path.join(__dirname, '../tasks/tasks.json');
  const tasksData = JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
  const task = tasksData.tasks.find(t => t.id === '$TASK_ID');
  if (task) {
    console.log(\`**Title:** \${task.title}\\n\\n**Description:** \${task.description}\\n\\n**Status:** \${task.status}\\n\\n**Details:** \${task.details || 'No details provided.'}\`);
  } else {
    console.log('Task not found');
  }
")

echo "$TASK_DETAILS" >> "$REPORT_FILE"

# Print the report path
echo -e "\nTest report generated: $REPORT_FILE"

# Open the report if on macOS
if [ "$(uname)" = "Darwin" ]; then
  open "$REPORT_FILE"
fi

# Return the test exit code
exit $TEST_EXIT_CODE
