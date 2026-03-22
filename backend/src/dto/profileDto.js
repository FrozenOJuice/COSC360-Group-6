import {
    buildProfileAssetUrl,
    createBaseProfilePayload,
    normalizeOptionalString,
    normalizeStringArray,
} from "../services/profilePresentation.js";

export function toSeekerProfileDto(profile) {
    const resumeLink = normalizeOptionalString(profile.resumeLink);

    return {
        ...createBaseProfilePayload(profile),
        bio: normalizeOptionalString(profile.bio),
        jobExperience: normalizeStringArray(profile.jobExperience),
        education: normalizeStringArray(profile.education),
        currentPosition: normalizeOptionalString(profile.currentPosition),
        profilePicture: buildProfileAssetUrl({
            profile,
            hasUploadedAsset: profile.hasUploadedProfilePicture,
            assetPath: (ownerId) => `/api/seeker-profile/${ownerId}/picture`,
        }),
        phone: normalizeOptionalString(profile.phone),
        resumeLink: resumeLink === "#" ? "" : resumeLink,
    };
}

export function toEmployerProfileDto(profile) {
    return {
        ...createBaseProfilePayload(profile),
        companyName: normalizeOptionalString(profile.companyName),
        companyDescription: normalizeOptionalString(profile.companyDescription),
        website: normalizeOptionalString(profile.website),
        logo: buildProfileAssetUrl({
            profile,
            hasUploadedAsset: profile.hasUploadedLogo,
            assetPath: (ownerId) => `/api/employer-profile/${ownerId}/logo`,
        }),
        location: normalizeOptionalString(profile.location),
        contactEmail: normalizeOptionalString(profile.contactEmail),
        contactPhone: normalizeOptionalString(profile.contactPhone),
    };
}
