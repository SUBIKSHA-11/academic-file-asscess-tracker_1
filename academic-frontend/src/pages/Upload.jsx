import { useState } from "react";
import axios from "../api/axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("department", "CSE");
    formData.append("year", 3);
    formData.append("semester", 5);
    formData.append("subject", subject);
    formData.append("category", "NOTES");
    formData.append("sensitivity", "PUBLIC");

    await axios.post("/files/upload", formData);
    alert("Uploaded!");
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Subject"
        onChange={(e) => setSubject(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default Upload;
