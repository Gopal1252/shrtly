const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function encode(num){
    const chars = []
    while(num){
        const ind = num%62;
        chars.push(BASE62[ind]);
        num = Math.floor(num/62);
    }
    return chars.reverse().join("");
}