const db = require("../../db/queries");


async function checkUserNameAvailability() {
    const inputText = document.getElementById("user_name").innerText
    const result = await db.onCheckUserNameAvailability(inputText)
    if(result)
    {
        return true
    }
    return false;
}

module.exports= {checkUserNameAvailability}