**Title**
Logout Button Not Working on Safari

**Description**
The logout button on the application does not function when accessed via the Safari browser. Clicking the button produces no response — the user remains logged in, and there is no visual or functional indication that the logout process has started. This issue prevents users from securely logging out of their accounts when using Safari.

**Steps to Reproduce**

1. Open the application in the Safari browser (tested on macOS and iOS).
2. Log into a valid user account.
3. Attempt to click the "Logout" button in the navigation or user menu.

**Expected vs Actual Behavior**

* **Expected:** The user should be logged out, redirected to the login page or homepage, and their session should end.
* **Actual:** Nothing happens. The button does not trigger any visible action or redirect, and the user remains logged in.

**Environment (if known)**

* Browser: Safari 17.5 (macOS Sonoma), Safari iOS 17+
* OS: macOS Sonoma, iOS 17
* Application version: \[Insert version if available]

**Severity or Impact**
* High — Users on Safari are unable to log out, which is a security concern and can impact session management.
