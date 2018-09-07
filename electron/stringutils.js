const stringutils = {
    replaceAll: (str, find, replace) => {
        return str.replace(new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), replace);
    }
}

module.exports = stringutils;