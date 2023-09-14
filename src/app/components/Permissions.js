import Axios from "axios";

async function checkForCookie()
{
    const response = await Axios.get("/validateCookie", { withCredentials: true });
    if (response.data.hasCookie == true)
    {
        return true;
    }
    return false;
}

export { checkForCookie };