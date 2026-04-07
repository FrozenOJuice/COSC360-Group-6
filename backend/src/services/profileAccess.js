import { appError } from "../utils/appError.js";

export function getProfileOwnerId(profile) {
    return typeof profile.userId === "string" ? profile.userId : String(profile.userId);
}

export function getProfileVisibility(profile) {
    return profile.visibility === "public" ? "public" : "private";
}

export function assertCanReadProfile(profile, viewer) {
    const ownerId = getProfileOwnerId(profile);
    const isOwner = viewer?.userId === ownerId;
    const isAdmin = viewer?.role === "admin";
    const isPublic = getProfileVisibility(profile) === "public";

    
    if(!isPublic) {
        if (!isOwner && !isAdmin) {
            throw appError("NOT_FOUND", "Profile not found");
        }
        
        throw appError("NOT_PUBLIC", "This profile is not public");
    }
}
