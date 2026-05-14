export const crearSolicitud = async (tipoFormulario: number) => {
  const resp = await fetch("/api/solicitud", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipoFormulario }),
  });

  if (!resp.ok) {
    throw new Error("No fue posible crear la solicitud");
  }

  const data = await resp.json();
  const solicitudId = data.solicitudId ?? data.solicitudid;

  if (!solicitudId) {
    throw new Error("Id de solicitud no devuelto");
  }

  return solicitudId;
};