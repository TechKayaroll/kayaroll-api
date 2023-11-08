exports.CompanyCode = async(length, companyName) => {
    let result = '';
    let characters = companyName.replaceAll(/[`~!@#$%^&*()|+-=?;:'",.<>{}[]\/\s]/gi,'');
    characters = characters.replaceAll(/\s/g,'')
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result.toUpperCase();
}

exports.RandomString = async(length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result.toUpperCase();
}