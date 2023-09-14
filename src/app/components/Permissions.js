import Axios from "axios";

async function checkForCookie()
{
    try
    {
        const response = await Axios.get("/validateCookie", { withCredentials: true });
        if (response.data.hasCookie == true)
        {
            return true;
        }
        return false;
    }
    catch (error)
    {
        throw new Error(`Failed to check for cookie: ${error.message}`);
    }
}

export { checkForCookie };