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
        minlength: 2,
        maxlength: 60,
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
        default: 'Not specified',
    },
    profilePicture: {
        type: String,
        default: '/default-profile.png',
    },
    phone: {
        type: String,
        default: 'Not specified',
    },
    resumeLink: {
        type: String,
        default: '#',
    }
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;
