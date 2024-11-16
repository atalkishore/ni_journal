

# Determine the maximum allowed uptime based on the day of the week
DAY_OF_WEEK=$(date +%u)  # %u gives the day of the week (1=Monday, 7=Sunday)

if [ "$DAY_OF_WEEK" -eq 6 ] || [ "$DAY_OF_WEEK" -eq 7 ]; then
    # Saturday (6) or Sunday (7) - Max uptime of 5 hours (5 hours * 3600 seconds)
    MAX_UPTIME_SECONDS=18000
else
    # Weekday (Monday to Friday) - Max uptime of 1 hour (1 hour * 3600 seconds)
    MAX_UPTIME_SECONDS=3600
fi

#!/bin/bash
cd /var/myprojects/niftyinvestui_uat/db
# Get the first container ID from docker-compose
FIRST_CONTAINER_ID=$(docker-compose ps -q | head -n 1)

# Get the current time in seconds since epoch
CURRENT_TIME_SECONDS=$(date +%s)

# Get the start time of the first container in seconds since epoch
START_TIME=$(docker inspect --format='{{.State.StartedAt}}' "$FIRST_CONTAINER_ID")
START_TIME_SECONDS=$(date -d "$START_TIME" +%s)

# Calculate the uptime in seconds for the first container
UPTIME=$((CURRENT_TIME_SECONDS - START_TIME_SECONDS))

# Check if the uptime exceeds the maximum allowed uptime
if [ "$UPTIME" -gt "$MAX_UPTIME_SECONDS" ]; then
    echo "First container $FIRST_CONTAINER_ID has been running for more than allowed uptime. Stopping the container..."
    # Stop the first container using docker-compose
    docker compose down
    # docker stack rm uat_uistack || { echo "Error: Unable to stop Docker stack."; exit 1; }
else
    echo "First container $FIRST_CONTAINER_ID uptime is within limits."
fi

cd /var/myprojects/niftyinvestui_uat
# Get the first container ID from docker-compose
SECOND_CONTAINER_ID=$(docker-compose ps -q | head -n 1)
# Get the start time of the first container in seconds since epoch
START_TIME=$(docker inspect --format='{{.State.StartedAt}}' "$SECOND_CONTAINER_ID")
START_TIME_SECONDS=$(date -d "$START_TIME" +%s)

# Calculate the uptime in seconds for the first container
UPTIME=$((CURRENT_TIME_SECONDS - START_TIME_SECONDS))

if [ "$UPTIME" -gt "$MAX_UPTIME_SECONDS" ]; then
    echo "SECOND container $SECOND_CONTAINER_ID has been running for more than allowed uptime. Stopping the container..."
    docker compose down
else
    echo "SECOND container $SECOND_CONTAINER_ID uptime is within limits."
fi