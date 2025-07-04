import DoctorNote from "../models/DoctorNote.js";
import User from "../models/User.js";

const createNote = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(401).json({ message: "Unauthorized request." });
    }

    const doctorId = req.user._id;
    if (!doctorId) {
      return res.status(400).json({ message: "Missing doctorId." });
    }
    const { patientId, title, diagnosis, treatmentNotes, tags } = req.body;
    const isConnected = await User.exists({
      _id: patientId,
      connections: {
        $elemMatch: {
          doctorId: req.user._id,
          status: "connected",
        },
      },
    });

    if (!!!isConnected) {
      return res.status(401).json({ message: "Connection does not exist." });
    }
    const newNote = new DoctorNote({
      patientId,
      doctorId,
      date: Date(),
      title,
      diagnosis,
      treatmentNotes,
      tags,
    });

    await newNote.save();
    return res
      .status(201)
      .json({ message: "Note has been saved successfully." });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const getAllNotes = async (req, res) => {
  try {
    const role = req.user.role;
    if (role === "doctor") {
      const patientId = req.body.patientId;
      const isConnected = !!(await User.exists({
        _id: patientId,
        connections: {
          $elemMatch: {
            doctorId: req.user._id,
            status: "connected",
          },
        },
      }));
      // console.log("isConnected: ", isConnected);
      if (!patientId) {
        return res.status(400).json({ message: "Missing patientId." });
      }

      const canViewPastNotes = await User.exists({
        _id: patientId,
        connections: {
          $elemMatch: {
            doctorId: req.user._id,
            viewPastNotes: true,
          },
        },
      });
      // console.log(canViewPastNotes);
      if (canViewPastNotes === true) {
        const allDoctorNotes = await DoctorNote.find(
          {
            patientId,
          },
          "title diagnosis treatmentNotes tags date"
        );
        return res.status(200).json(allDoctorNotes);
      } else if (req.body.viewPastNotes !== true) {
        const currentDoctorNotes = await DoctorNote.find(
          {
            patientId,
            doctorId: req.user._id,
          },
          "title diagnosis treatmentNotes tags date"
        );
        return res.status(200).json(currentDoctorNotes);
      }
    } else if (role === "patient") {
      const doctorNotes = await DoctorNote.find(
        { patientId: req.user._id },
        "doctorId title diagnosis treatmentNotes tags date"
      ).lean();
      return res.status(200).json(doctorNotes);
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export { createNote, getAllNotes };
