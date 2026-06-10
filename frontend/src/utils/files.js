export const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => {
    resolve(reader.result);
  };

  reader.onerror = () => {
    reject(new Error(`No se pudo leer el archivo ${file.name}.`));
  };

  reader.readAsDataURL(file);
});
