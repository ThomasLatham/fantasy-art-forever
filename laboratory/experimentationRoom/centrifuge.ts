import putTestTubeInCentrifuge from "./beakersAndSuch";

const turnOnCentrifuge = async (): Promise<void> => {
  await putTestTubeInCentrifuge();
};

turnOnCentrifuge();
