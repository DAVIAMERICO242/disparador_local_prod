export function formatPhoneNumber(number:string):(string|boolean){
    console.log('NUMERO QUE ENTROU')
    console.log(number)
    if(!number){
      return false;
    }
    var formattedNumber = number.replace(/[\(\)\-\s]/g, "");
    var formattedNumber = formattedNumber.replace('+',"")
    if(formattedNumber.length===10 || formattedNumber.length===11){
      var formattedNumber = '55' + formattedNumber;
    }
    var formattedNumber = formattedNumber + ((process.env.WPPAPI_PHONE_PATTERN)?(process.env.WPPAPI_PHONE_PATTERN):'')
    return formattedNumber;
}
