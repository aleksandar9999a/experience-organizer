import { auth, firestore, storage } from "./../firebase";

export async function setUserData(data) {
    return await setData(data, `users/${data.uid}`);
}

export async function setProject(data) {
    return await setData(data, `projects/${data.id}`);
}

export function getUsersCollection() {
    return firestore.collection('users');
}

export function getUser(id) {
    return getUsersCollection().doc(id);
}

export function getMyProfile() {
    if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        return getUsersCollection().doc(uid);
    }
    return null;
}

export function searchUserByName(name) {
    return getUsersCollection().where('firstName', '>=', name).limit(5);
}

export function getProjects() {
    return firestore.collection('projects');
}

export function getProject(id) {
    return getProjects().doc(id);
}

export function getProjectsByCreator(id) {
    return firestore.collection('projects').where('creator_id', '==', id);
}

async function setData(data, ref) {
    if (data.image && typeof data.image === 'object') {
        data.image = await uploadImage(data.image);
    }

    return await firestore.doc(ref).set(data);
}

function updateOneFieldFromProfile(field, data) {
    return getMyProfile().update({ [field]: data });
}

export async function updateProfileImage(image) {
    let url;
    if (typeof image === 'object') {
        url = await uploadImage(image);
    } else {
        url = image;
    }

    return await updateOneFieldFromProfile('image', url);
}

export async function updateNames(first, last) {
    updateOneFieldFromProfile('firstName', first);
    updateOneFieldFromProfile('lastName', last);
}

export async function createProject(project) {
    if (auth.currentUser) {
        project.id = createID();
        project.creator = auth.currentUser.uid;
        return await getProjects().doc(project.id).set(project);    
    }
    return null;
}

async function uploadImage(img, id) {
    if (!id) {
        id = createID();
    }
    const storageRef = storage.ref(id);
    return await storageRef.put(img).then(getUrl);
}

async function getUrl(snapshot) {
    return await snapshot.ref.getDownloadURL();
}

function createID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}