import PageHeader from "../components/PageHeader";
import AuthForm from "../components/AuthForm";
import { AUTH, asset } from "../data";
import { useReveal } from "../hooks";

export default function Login() {
  const pageRef = useReveal();
  const { title, intro } = AUTH.login;

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow={AUTH.login.eyebrow}
        title={title}
        intro={intro}
        image={asset("img/riverfront.jpg")}
        pos="center 55%"
      />

      <section className="section">
        <div className="shell auth__shell" data-reveal>
          <AuthForm mode="login" />
        </div>
      </section>
    </div>
  );
}
