import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    navigate("/question", { state: { from: location }, replace: true });
  }, [navigate, location]);

  return null;
}
