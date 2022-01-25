# GMAIL API
The solution in this module connects you to any Gmail account and extracts specific tenant inquiries by a user defined search field. Emails are received as they arrive in real time with a 5 second delay. Then our emails are stored in a JSON object located in a sperate file.


# Requirements:
* A Gmail developer API (Already included)
* VisualStudio Code (Source code-editor)
* Gmail API Enabled (Included with email)
* Gmail account (using rfdm soluitons temp email)


# How to use
Move into the Gmail folder, and load the project
```bash
node .
```
Since I have included both the authentication token, and credentials the program should begin to run immediately.


# Usage
In a matter of seconds all email queries within from the INBOX of the specified keyword will appear in a table format.
[![blur.jpg](https://i.postimg.cc/fyxwdzy9/blur.jpg)](https://postimg.cc/7JZ88ygH)

Our results are then saved in a file called subject.json
[![subjects.png](https://i.postimg.cc/ZnmG1rYW/subjects.png)](https://postimg.cc/sQnHWGhz)


# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

