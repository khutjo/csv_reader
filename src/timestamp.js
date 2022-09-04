function padding(num){
    strnum = num.toString(10)
    if (strnum.length == 1)
        strnum = "0"+strnum
    return strnum
}



module.exports = {
    gettimestamp:
function gettimestamp(){
    var months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];

    const date = new Date();
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hour = padding(date.getHours());
    const minute = padding(date.getMinutes());
    const second = padding(date.getSeconds());
    return day +" "+ month+" "+ year +" "+hour+":"+minute+":"+second
}}