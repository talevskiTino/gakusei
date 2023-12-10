import { LinksFunction } from '@remix-run/node';
import { Form, Link } from '@remix-run/react';
import { transform } from 'esbuild';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import stylesUrl from '~/styles/blogs.css';
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

export default function Navbar({ user = null }: { user?: any }) {
  const [rotationSpeed, setRotationSpeed] = useState(0.2);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [rotationDirection, setRotationDirection] = useState(-1);
  useEffect(() => {
    const requestId = { current: null as number | null };

    const rotateLogo = () => {
      setRotationSpeed(rotationDirection === -1 ? 1 : 0.2);
      setRotationDegree(
        (prevDegree) => prevDegree + rotationSpeed * rotationDirection
      );
      requestId.current = requestAnimationFrame(rotateLogo);
    };

    rotateLogo();

    return () => {
      if (requestId.current !== null) {
        cancelAnimationFrame(requestId.current);
      }
    };
  }, [rotationDirection]);

  const handleMouseEnter = () => {
    setRotationDirection(1);
  };

  const handleMouseLeave = () => {
    setRotationDirection(-1);
  };

  return (
    <header className="blogs-header">
      <div className="custom-container" style={{ position: 'relative' }}>
        <h1 className="home-link">
          <Link to="/" title="Remix Blogs" aria-label="Remix Blogs">
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '5%',
                transform: `translate(-50%, -50%)`,
                height: '44px',
              }}
            >
              <svg
                fill="#000000"
                width="44px"
                height="44px"
                viewBox="-3.2 -3.2 38.40 38.40"
                id="icon"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#000000"
                transform="rotate(0)"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0">
                  <path
                    transform="translate(-3.2, -3.2), scale(1.2)"
                    d="M16,29.11410644816028C18.3611321764303,29.597335456081023,21.22195452118116,29.781109444082883,23.049255225393505,28.209668205901952C24.912117665805187,26.607644601810406,23.760772167111302,23.311849799068106,25.12393680893047,21.267707372705143C26.635693376615126,19.000742955103263,31.06211911615978,18.721729480472398,31.191441294219757,16C31.317967084277647,13.337123624063006,27.01525016564503,12.718079379608293,25.638643714259395,10.435126456949448C24.302232684135127,8.218833293406048,25.736582524801527,4.304748205167345,23.43070005708271,3.1296499653277987C21.071990446252705,1.9276305429237632,18.633983950721127,5.257687753568808,16,5.5231877863407135C13.744370448046723,5.750550492860211,11.596907434154883,4.0411571794051735,9.386605713930399,4.54526508604174C6.9025596600533845,5.1118064069622084,4.442009761654079,6.394834266017133,2.992149615064916,8.489914078679343C1.513036695320317,10.627264792191209,0.4116903500631133,13.621348600310169,1.4595742275317498,15.999999999999996C2.5725631988665043,18.52643716677852,6.384370015738386,18.445539984427572,8.267369370592185,20.464436375432538C9.56339980004111,21.854001990472383,9.17417247433633,24.212573950384154,10.44059009270535,25.629180419536105C11.923534995829877,27.287992893945308,13.82014816045032,28.66797825069852,16,29.11410644816028"
                    fill="#ffffff"
                    strokeWidth="0"
                  ></path>
                </g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="#CCCCCC"
                  strokeWidth="0.192"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <defs>
                    <style></style>
                  </defs>
                  <polygon points="8 11 11 11 11 23 13 23 13 11 16 11 16 9 8 9 8 11"></polygon>
                  <path d="M23,15V13H20V11H18v2H16v2h2v6a2,2,0,0,0,2,2h3V21H20V15Z"></path>
                </g>
              </svg>{' '}
            </div>
            <div
              id="svg-logo"
              style={{
                width: '56px',
                height: '56px',
                position: 'absolute',
                top: '50%',
                left: '5%',
                transform: `translate(-50%, -50%) rotate(${rotationDegree}deg)`,
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <svg height="56" width="56" viewBox="0 0 56 56">
                <path
                  d="M29.465,0.038373A28,28,0,0,1,52.948,40.712L51.166,39.804A26,26,0,0,0,29.361,2.0356Z"
                  className="text-team-yellow"
                  fill="currentColor"
                ></path>
                <path
                  d="M51.483,43.250A28,28,0,0,1,4.5172,43.250L6.1946,42.161A26,26,0,0,0,49.805,42.161Z"
                  className="text-team-blue"
                  fill="currentColor"
                ></path>
                <path
                  d="M3.0518,40.712A28,28,0,0,1,26.535,0.038373L26.639,2.0356A26,26,0,0,0,4.8338,39.804Z"
                  className="text-team-red"
                  fill="currentColor"
                ></path>
              </svg>
            </div>

            {/* <div className="logo">🤔</div>
            <div className="logo-medium">BL🤔GS</div> */}
          </Link>
        </h1>
        {user ? (
          <div className="user-info">
            <span>{`Hi ${
              user.username.charAt(0).toUpperCase() + user.username.slice(1)
            }`}</span>
            <Form action="/logout" method="post">
              <button type="submit" className="button">
                Logout
              </button>
            </Form>
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </header>
  );
}
