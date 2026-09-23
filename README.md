# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
While click on the booking on each booking the details should be shown with proper details and buttons in the same details page add the update buttons for status and payment.While checkin in mahal the admin or manager should have to upload the eb meter unit pic in the check in progress and again while check out user should upload the pic of eb meter then while booking in room or mahal user should upload the aadhar card or other identity pics as mandatory and that should be should in invoice and bill redisign the full invoice and bill for both rooms and mahal add the user profile with address and company details of user with adhar pic also need to be printed in invoice as second pages and then add the terms and condittions for one page under signature mus tbe there of customer and admin or manager then in mahal last invoice eb meter initital pic and last pic also there if any damage report that pic also be there every pic must have the time stamp while uploading it and make the invoice design more premuim while taking any bills there should be two copies mention there as a customer copy and administration copy ask this before printing copy needed and make it also disable and default two copies must be print in a4 size then add the whatsapp template to share the quatotion and bills and [payment remainder all data for the customer number 

For admin and manager panel make it more simple and easily accesible for booking the room first need to choose the room number and then the amount should be standart or custom if manager or admin choose the custom the amount should be entered and the entered amount should be paid by customer.After choosing Room number then collect the Guest details with headcounts and their aadhar should be taken picture for each any one is mandatory then take the members pic and upload then if they belong to any compay enter the GST number along company name with contact details.and final before payment choose the bill type normal bill and GST bill normal the cost should be normal as standard and GST should have the SGST and CGST of calculation invoice should have the check in and check out time address are attached.Make the invoice more attractiv the rooms are 20 in Residency and mahal holds 6 rooms.All room booking enteries should be in Caps letter only

In the admin pages need a expenses page each expense value should be recorded share show in value in dashboard value then make the Bills page as two one is GST bills and other is Normal bills make the bills store there and need the centralized financial db that shows all the transactions.with proper ui view and make the new page named GST sharing make the table that need to shared with CA for GST claim so all details should be there and need to share that make the export button admin can export it and send that.