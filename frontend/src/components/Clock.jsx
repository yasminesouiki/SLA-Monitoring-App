import { useState, useEffect } from "react";


export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id); // on nettoie le timer quand le composant disparaît
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <span className="clock">
      {date} {time}
    </span>
  );
}