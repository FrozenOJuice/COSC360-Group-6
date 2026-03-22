import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    bio: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 500,
    },
    jobExperience: {
        type: [String],
        default: [],
    },
    education: {
        type: [String],
        default: [],
    },
    currentPosition: {
        type: String,
        trim: true,
        maxlength: 120,
        default: 'Not specified',
    },
    profilePicture: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '/default-profile.png',
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 40,
        default: 'Not specified',
    },
    resumeLink: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '#',
    }
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;
