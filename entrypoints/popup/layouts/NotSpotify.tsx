export default function NotSpotify() {
  const openSpotify = () => chrome.tabs.create({
    active: true,
    url: 'https://open.spotify.com',
  })

  return (
    <div class="flex flex-col gap-2">
      <h1>
        <strong>
          Looks like you don't have Spotify opened in the current tab :/
        </strong>
      </h1>
      <a class="underline text-accent cursor-pointer" onClick={openSpotify}>
        Open Spotify Web Player
      </a>
    </div>
  )
}
