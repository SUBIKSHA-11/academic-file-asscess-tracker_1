import { useState } from "react";
import axios from "../api/axios";

function Upload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("department", "CSE");
    formData.append("year", 3);
    formData.append("semester", 5);
    formData.append("category", "NOTES");
    formData.append("sensitivity", "PUBLIC");

    await axios.post("/files/upload", formData);
    alert("Uploaded!");
  };

  return (
    <div>
      <input type="file"
        onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default Upload;
