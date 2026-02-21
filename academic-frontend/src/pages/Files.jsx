import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import {
  Search,
  Download,
  Eye,
  Trash2,
  Filter,
  Upload
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";

function Files() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchFiles(currentPage);
  }, [currentPage]);

  const fetchFiles = async (page = 1) => {
    try {
      const res = await axios.get(`/files?page=${page}&limit=${limit}`);
      setFiles(res.data.files || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/files/${id}`);
      fetchFiles(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(search.toLowerCase()) &&
    (category ? file.category === category : true)
  );
const handleDownload = async (id, fileName) => {
  try {
    const res = await axios.get(`/files/download/${id}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed", error);
  }
};

const handleView = async (id) => {
  try {
    const res = await axios.get(`/files/view/${id}`, {
      responseType: "blob",
    });

    const fileURL = window.URL.createObjectURL(res.data);

    window.open(fileURL, "_blank", "noopener,noreferrer");

  } catch (error) {
    console.error("View failed", error);
  }
};


  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Academic Files
      </h2>

      {/* Upload Button for ADMIN & FACULTY */}
      {(user?.role === "ADMIN" || user?.role === "FACULTY") && (
        <div className="mb-6">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 bg-[#0C3C01] text-[#F1F2ED] px-4 py-2 rounded-lg shadow-md hover:bg-[#5B6D49] transition-colors"
          >
            <Upload size={18} />
            Upload File
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md w-64">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search file..."
            className="outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md">
          <Filter size={18} className="text-gray-400" />
          <select
            className="outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="NOTES">NOTES</option>
            <option value="LAB">LAB</option>
            <option value="QUESTION_PAPER">QUESTION_PAPER</option>
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="MARKSHEET">MARKSHEET</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-[#DFD9D8] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#2E2D1D] text-[#F1F2ED]">
            <tr>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Year</th>
              <th className="p-3 text-left">Semester</th>
              <th className="p-3 text-left">Sensitivity</th>
              <th className="p-3 text-left">Uploaded By</th>
              <th className="p-3 text-left">Downloads</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{file.fileName}</td>
                <td className="p-3">{file.category}</td>
                <td className="p-3">{file.department}</td>
                <td className="p-3">{file.year}</td>
                <td className="p-3">{file.semester}</td>
                <td className="p-3">{file.sensitivity}</td>
                <td className="p-3">{file.uploadedBy?.name}</td>
                <td className="p-3">{file.downloadCount}</td>

                <td className="p-3 flex justify-center gap-3">

                  {/* VIEW - ALL ROLES */}
          <button
  onClick={() => handleView(file._id)}
  className="text-[#5B6D49] hover:text-[#0C3C01]"
>
  <Eye size={18} />
</button>


                  {/* DOWNLOAD - ALL ROLES */}
                  <button
  onClick={() => handleDownload(file._id, file.fileName)}
  className="text-[#5B6D49] hover:text-[#0C3C01]"
>
  <Download size={18} />
</button>


                  {/* DELETE - ADMIN always, FACULTY own file */}
                  {(user?.role === "ADMIN" ||
                    (user?.role === "FACULTY" &&
                      file.uploadedBy?._id === user._id)) && (
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="text-[#B44446] hover:text-[#64242F]"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Files;
