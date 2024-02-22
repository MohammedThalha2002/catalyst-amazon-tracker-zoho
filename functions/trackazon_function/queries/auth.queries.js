var catalyst = require("zcatalyst-sdk-node");

const findUserByEmail = async (req, email) => {
  var app = catalyst.initialize(req);
  let zcql = app.zcql();

  let query = `select * from users where email = '${email}'`;
  let queryRes = await zcql.executeZCQLQuery(query);

  let user = null;

  if (queryRes.length > 0) {
    const result = queryRes[0].Users
    user = {
      ROWID : result.ROWID,  
      userId: result.userId,
      email: result.email,
      token: result.token,
    };
  }

  // console.log(user);

  return user;
};

module.exports = { findUserByEmail };
