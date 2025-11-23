# TODO

This is a digital assistant to help me manage my business. It starts with just a calendar functionality through a Telegram interface.

AI instructions: test-driven development, so create tests that go from red, green, to refactor. don't commit while in progress, only after refactor.

AI instructions: for the calendar functionality, use a date variable and always add it to the prompt to make the AI aware of the current date.

- /help: displays possible commands
- /addcal: add an appointment to the calendar. it needs to be in a fixed format, as the calendar tracks the day, time, contact name, and category. For example "/addcal 21-11-2025. Peter van der Meer. Ghostin 06", the separator is the dot.
- /viewcal displays all appointments in a list format
- /7days displays all appointments in a list format, but limited to today and the next 6 days.
