import Axios from "axios";

async function checkForCookie()
{
    try
    {
        const response = await Axios.get("/getUser", { withCredentials: true });
        if (response.data.username)
        {
            return true;
        }
        return false;
    }
    catch (error)
    {
        //throw new Error(`Failed to check for cookie: ${error.message}`);
    }
}

export { checkForCookie };