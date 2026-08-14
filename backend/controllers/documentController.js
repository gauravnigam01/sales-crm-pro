import fs from "fs";

import Document from "../models/Document.js";
import { buildScopeFilter, isUserInScope } from "../utils/teamScope.js";

const canAccessDocument = async (user, document) => {
  if (user.role === "admin") return true;

  const uploadedById = document.uploadedBy?._id || document.uploadedBy;

  if (user.role === "caller") {
    return uploadedById?.toString() === user._id.toString();
  }

  return isUserInScope(user, uploadedById);
};

// ======================================
// Upload Document
// ======================================

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No File Uploaded",
      });
    }

    const document = await Document.create({
      title: req.body.title || req.file.originalname,
      category: req.body.category || "Other",
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      relatedLead: req.body.relatedLead || null,
      relatedCustomer: req.body.relatedCustomer || null,
      relatedDeal: req.body.relatedDeal || null,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Document Uploaded Successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Documents
// ======================================

export const getAllDocuments = async (req, res) => {
  try {
    const filter = await buildScopeFilter(req.user, "uploadedBy");

    const documents = await Document.find(filter)
      .populate("relatedLead", "customerName")
      .populate("relatedCustomer", "customerName")
      .populate("relatedDeal", "title")
      .populate("uploadedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Download Document
// ======================================

export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document Not Found",
      });
    }

    if (!(await canAccessDocument(req.user, document))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: "File Missing on Server",
      });
    }

    res.download(document.filePath, document.originalName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Document
// ======================================

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document Not Found",
      });
    }

    if (!(await canAccessDocument(req.user, document))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Document Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
