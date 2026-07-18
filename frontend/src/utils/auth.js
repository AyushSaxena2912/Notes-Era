import { redirect } from "react-router-dom";
import Cookies from "js-cookie";
import axios from 'axios';

export function getNotesAuthToken(){
    const token = Cookies.get('notestoken');
    return token;
}

export async function checkNotesAuthLoader(){
    const BASE_URL='https://notesera-basic-backend-d3bk.onrender.com'
    const token = getNotesAuthToken();
    let getvalue;
    try{
     getvalue = await axios.get(`${BASE_URL}/auth/checkvalidity`,{
        headers:{
            Authorization :`Bearer ${token}`
        }
    })}
    catch(error){
        return redirect('/noteslogin')
    }
    if(!getvalue){
        return redirect('/noteslogin')
    }
    return null
}
