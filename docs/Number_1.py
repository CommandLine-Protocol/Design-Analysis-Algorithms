PM2_5=[23,31,34,42,40,42,27,23,27,26,23,31]
Month =["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
Temperature=[40,43,48,53,64,68,75,48,48,60,53,40]
Humidity=[26,25,29,38,42,38,34,42,38,32,31,26]

#Number 1
highest = max(PM2_5)
index = PM2_5.index(highest)
print("Month with the highest PM2.5 concentration:", Month[index])

#Number 3
highest = max(Humidity)
index = Humidity.index(highest)
print("Month with the highest Humidity:", Month[index])

#Number 5
lowest = min(PM2_5)
index = PM2_5.index(lowest)
print("Month with the lowest PM2.5 concentration:", Month[index])


#Number7
PM2_5 = {
    "January": 23,
    "February": 31,
    "March": 34,
    "April": 42,
    "May": 40,
    "June": 42,
    "July": 27,
    "August": 23,
    "September": 27,
    "October": 26,
    "November": 23,
    "December": 31
}

# II. Ask the user to enter a month
month = input("Enter a month: ")

if month in PM2_5:
    print("PM2.5 concentration:", PM2_5[month], "μg/m³")
else:
    print("Month not found.")

# III. Find the month with the highest PM2.5 concentration
highest_month = max(PM2_5, key=PM2_5.get)

print("Month with the highest PM2.5 concentration:", highest_month)
print("Highest concentration:", PM2_5[highest_month], "μg/m³")

# IV. Calculate the average PM2.5 concentration
average = sum(PM2_5.values()) / len(PM2_5)

print("Average PM2.5 concentration:", average, "μg/m³")