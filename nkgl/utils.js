export async function loadFileAsync(fileName) {
    try {
        const response = await fetch(fileName);
        return response.text();
    }
    catch (err) {
        console.log(err);
    }
}
