
const SHOW_AD = process.env.SHOW_AD || 'false'
const SHOW_MEDIA_AD = process.env.SHOW_MEDIA_AD || 'false'
const ENABLE_CLARITY = process.env.ENABLE_CLARITY || 'false'
const SECRET = process.env.SECRET
const VERSION = process.env.VERSION
const GOGGLE_CLIENT_ID = process.env.GOGGLE_CLIENT_ID
const GOGGLE_CLIENT_SECRET = process.env.GOGGLE_CLIENT_SECRET
const GOGGLE_REDIRECT_URI = process.env.GOGGLE_REDIRECT_URI
const ZOHO_HOST = process.env.ZOHO_HOST
const ZOHO_PORT = process.env.ZOHO_PORT
const ZOHO_SSL = process.env.ZOHO_SSL
const ZOHO_FROM = process.env.ZOHO_FROM
const ZOHO_USER_ID = process.env.ZOHO_USER_ID
const ZOHO_USER_PASSWORD = process.env.ZOHO_USER_PASSWORD
const MONGO_DB_URL = process.env.MONGO_DB_URL
const MONGO_DB_NAME = process.env.MONGO_DB_NAME
const ENVNAME = process.env.ENVNAME
const SECRET_KEY = process.env.SECRET_KEY
const STATIC_FILES = process.env.STATIC_FILES
const STATIC_FILES_ALT = process.env.STATIC_FILES_ALT
const HOST = process.env.HOST
const REDISDB_URL = process.env.REDISDB_URL
const REDISDB_PORT = process.env.REDISDB_PORT
const REDISDB_PASSWORD = process.env.REDISDB_PASSWORD
const MAILGUN_SECRET = process.env.MAILGUN_SECRET
const DISP_NAME = process.env.DISP_NAME
const PG_IM_CLIENT_ID = process.env.PG_IM_CLIENT_ID
const PG_IM_CLIENT_SECRET = process.env.PG_IM_CLIENT_SECRET
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5005'


module.exports = {
    SHOW_AD,
    SHOW_MEDIA_AD,
    ENABLE_CLARITY,
    SECRET,
    VERSION,
    GOGGLE_CLIENT_ID,
    GOGGLE_CLIENT_SECRET,
    GOGGLE_REDIRECT_URI,
    ZOHO_HOST,
    ZOHO_FROM,
    ZOHO_USER_ID,
    ZOHO_USER_PASSWORD,
    MONGO_DB_URL,
    MONGO_DB_NAME,
    ENVNAME,
    SECRET_KEY,
    STATIC_FILES,
    STATIC_FILES_ALT,
    HOST,
    REDISDB_URL,
    REDISDB_PORT,
    REDISDB_PASSWORD,
    MAILGUN_SECRET,
    DISP_NAME,
    PG_IM_CLIENT_ID,
    PG_IM_CLIENT_SECRET,
    ZOHO_PORT,
    ZOHO_SSL
};