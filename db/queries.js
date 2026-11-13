const pool = require("./pool");
async function onCheckUserNameAvailability(user_name) {
  const user = await pool.query(
    "SELECT user_name FROM users where user_name=$1",
    [user_name],
  );
  return user;
}

async function insertUser(user) {
  await pool.query(
    "INSERT INTO users (full_name, user_name, hash, salt, member_status) VALUES ($1, $2, $3, $4, $5)",
    [user.full_name, user.user_name, user.hash, user.salt, "non-member"],
  );
}

async function addMessageToUser(userId, message) {
  const messageId = (
    await pool.query(
      "INSERT INTO messages (title,text) VALUES ($1,$2) RETURNING id;",
      [message.title, message.text],
    )
  ).rows[0].id;
  await pool.query(
    "INSERT INTO user_messages(user_id,message_id) VALUES ($1,$2)",
    [userId, messageId],
  );
}
async function getUser(username) {
  return await pool.query("SELECT * from users where user_name=$1", [username]);
}

async function loadMessages() {
    return await pool.query("Select * from messages")
}

async function getUserMessages(userId) {
 const messagesRow =  (await pool.query("SELECT message_id from user_messages where user_id=$1",[userId])).rows
 const userMessages = []
 await Promise.all(messagesRow.map(async (message)=>{
   userMessages.push((await pool.query("SELECT * from messages where id= $1",[message.message_id])).rows[0]) 
 }))
 return userMessages
}

async function checkAdmin(userName) {
    await pool.query("UPDATE users SET member_status = 'admin' WHERE user_name = $1", [userName])
}

async function deleteMessage(messageId) {
    await pool.query('DELETE from messages where id =$1',[messageId])
}
module.exports = {
  onCheckUserNameAvailability,
  insertUser,
  getUser,
  addMessageToUser,
  loadMessages,
  getUserMessages,
  checkAdmin,
  deleteMessage
};
