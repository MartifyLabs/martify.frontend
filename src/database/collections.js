import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";

export const getCollection = async (policyId) => {
  try {
    if (policyId) {
      const reference = doc(firestore, "collections", policyId);

      const snapshot = await getDoc(reference);

      if (snapshot.exists()) {
        return snapshot.data();
      } else {
        const collection = { verified: false };

        //await saveCollection(collection, policyId);

        return collection;
      }
    }
  } catch (error) {
    console.error(
      `Unexpected error in getCollection. [Message: ${error.message}]`
    );
    throw error;
  }
};

export const saveCollection = async (collection, policyId) => {
  try {
    if (collection) {
      const reference = doc(firestore, "collections", policyId);

      await setDoc(reference, collection, { merge: true });
    }
  } catch (error) {
    console.error(
      `Unexpected error in saveCollection. [Message: ${error.message}]`
    );
    throw error;
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const setCollectionCreator = async (address, percentage, policyId) => {
  if (address && percentage) {
    await saveCollection({ royalties: { address, percentage } }, policyId);
  }
};

export const setCollectionStatus = async (verified: Boolean, policyId) => {
  await saveCollection({ verified }, policyId);
};


/* get opencnft */

export const saveOpencnft = async (data, key) => {
  try {
    if (data) {
      const reference = doc(firestore, "opencnft", key);
      await setDoc(reference, data, { merge: true });
    }
  } catch (error) {
    console.error(
      `Unexpected error in saveCollection. [Message: ${error.message}]`
    );
    throw error;
  }
};

export const getOpencnftTopProjects = async (time) => {
  try {
    
    let time_outdated = 60 * 60 * 1000; // every hour
    let time_now = new Date().getTime();

    const reference = doc(firestore, "opencnft", "_top_projects_"+time);
    const snapshot = await getDoc(reference);

    let return_top_projects = false;
    let backup_return_top_projects = false

    if (snapshot.exists()){
      let data = snapshot.data();
      // console.log("gotten data", data);
      if((time_now - data.last_updated) < time_outdated){
        // console.log("get existing top projects", time_now, data.last_updated, (time_now - data.last_updated) < time_outdated);
        return_top_projects = data.rankings;
      }else{
        backup_return_top_projects = data.rankings;
      }
    }

    if(return_top_projects == false){
      
      const top_projects = await fetch(`https://api.opencnft.io/1/rank?window=${time}` , {})
        .then((res) => res.json())
        .then((res) => {
          return res.ranking;
        })
        .catch((err) => {
          return false;
        });
      
      if(top_projects){
        let to_db = {
          last_updated: time_now,
          rankings: top_projects
        }
        
        await saveOpencnft(to_db, "_top_projects_"+time);
        // console.log("updated top projects");
        return_top_projects = top_projects;
      }
      else if(backup_return_top_projects){ // for some reason opencnft is down, but lucky we have records in our own database
        return_top_projects = backup_return_top_projects;
      }
      
    }
    return return_top_projects;
  
  } catch (error) {
    console.error(
      `Unexpected error in getOpencnft. [Message: ${error.message}]`
    );
    throw error;
  }
};

export const getOpencnftPolicy = async (policy_id) => {
  try {
    
    let time_outdated = 60 * 60 * 1000; // every hour
    let time_now = new Date().getTime();

    const reference = doc(firestore, "opencnft", "policy_"+policy_id);
    const snapshot = await getDoc(reference);

    let return_project_stats = false;
    let backup_return_project_stats = false

    if (snapshot.exists()){
      let data = snapshot.data();
      // console.log("gotten data", data);
      if((time_now - data.last_updated) < time_outdated){
        // console.log("get existing opencnft data", time_now, data.last_updated, (time_now - data.last_updated) < time_outdated);
        return_project_stats = data.rankings;
      }else{
        backup_return_project_stats = data.rankings;
      }
    }

    if(return_project_stats == false){
      
      const project_stats = await fetch(`https://api.opencnft.io/1/policy/${policy_id}`, {})
        .then((res) => res.json())
        .then((res) => {
          return res;
        })
        .catch((err) => {
          return false;
        });
      
      if(project_stats){
        let to_db = {
          last_updated: time_now,
          rankings: project_stats
        }
        
        await saveOpencnft(to_db, "policy_"+policy_id);
        // console.log("updated opencnft collection", policy_id);
        return_project_stats = project_stats;
      }
      else if(backup_return_project_stats){ // for some reason opencnft is down, but lucky we have records in our own database
        return_project_stats = backup_return_project_stats;
      }
      
    }
    return return_project_stats;
  
  } catch (error) {
    console.error(
      `Unexpected error in getOpencnft. [Message: ${error.message}]`
    );
    throw error;
  }
};
