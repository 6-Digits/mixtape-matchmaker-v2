// Ensures only one audio source plays at a time across the app.
// Any caller starting playback claims the bus; the previously-claimed
// stop callback is invoked to silence whatever was playing before.

type StopFn = () => void;

let activeStop: StopFn | null = null;

export function claimAudio(stop: StopFn): void {
  if (activeStop && activeStop !== stop) {
    const previous = activeStop;
    activeStop = stop;
    previous();
    return;
  }
  activeStop = stop;
}

export function releaseAudio(stop: StopFn): void {
  if (activeStop === stop) activeStop = null;
}
