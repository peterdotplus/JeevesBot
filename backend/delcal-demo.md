# JeevesBot /delcal Command Demonstration

## Overview
The `/delcal` command allows you to delete appointments from your calendar using the same numbering system shown in the `/viewcal` command.

## How It Works

### 1. View Your Appointments First
Use `/viewcal` to see all your appointments with numbered listings:

```
📅 All Appointments

Current Date: 23-11-2025

1. 21-11-2025 14:30 - Peter van der Meer (Ghostin 06)
2. 22-11-2025 10:00 - John Doe (Meeting)
3. 23-11-2025 09:00 - Jane Smith (Call)
```

### 2. Delete an Appointment
Use the number from the `/viewcal` output to delete an appointment:

**Command:** `/delcal 2`

**Response:**
```
🗑️ Appointment deleted successfully!

Current Date: 23-11-2025

Appointment #2 has been removed from your calendar.
```

### 3. Verify Deletion
Check `/viewcal` again to confirm:

```
📅 All Appointments

Current Date: 23-11-2025

1. 21-11-2025 14:30 - Peter van der Meer (Ghostin 06)
2. 23-11-2025 09:00 - Jane Smith (Call)
```

## Usage Examples

### Valid Usage:
- `/delcal 1` - Deletes the first appointment
- `/delcal 3` - Deletes the third appointment
- `/delcal 5` - Deletes the fifth appointment (if it exists)

### Error Handling:

**No number provided:**
```
❌ Usage: /delcal NUMBER

Current Date: 23-11-2025

Example: /delcal 3 (to delete the 3rd appointment shown in /viewcal)

Use /viewcal first to see the appointment numbers.
```

**Invalid number:**
```
❌ Invalid number!

Current Date: 23-11-2025

Please provide a valid number. Example: /delcal 3
```

**Number out of range:**
```
❌ Error deleting appointment

Current Date: 23-11-2025

Invalid appointment number. Please use a number between 1 and 3
```

## Key Features

- **Number Matching**: Uses the exact same numbering as `/viewcal` command
- **Error Prevention**: Validates numbers and provides clear error messages
- **Immediate Feedback**: Shows success confirmation with current date
- **Data Persistence**: Changes are saved immediately to the calendar data file

## Best Practices

1. Always use `/viewcal` first to see the current appointment numbers
2. Double-check the number before deleting
3. Use `/viewcal` after deletion to verify the change
4. Remember that numbers will automatically reorder after deletions

## Integration with Other Commands

- `/help` - Shows all available commands including `/delcal`
- `/addcal` - Add new appointments
- `/viewcal` - View all appointments with numbers
- `/7days` - View appointments for the next week