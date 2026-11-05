const $ = (id) => document.getElementById(id);
const input = $("rut");

function limpiar(valor) {
  return valor.replace(/[^0-9kK]/g, "").toUpperCase();
}

function formatear(valor) {
  const c = limpiar(valor);
  if (c.length < 2) return c;
  const cuerpo = c.slice(0, -1).replace(/K/g, "");
  const dv = c.slice(-1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
}

// Módulo 11: devuelve el DV esperado y el detalle del cálculo
function calcularDV(cuerpo) {
  const factores = [2, 3, 4, 5, 6, 7];
  const filas = [];
  let suma = 0;
  const digitos = cuerpo.split("").reverse();
  digitos.forEach((d, i) => {
    const f = factores[i % 6];
    const p = Number(d) * f;
    suma += p;
    filas.push({ d, f, p });
  });
  const resto = suma % 11;
  const r = 11 - resto;
  const dv = r === 11 ? "0" : r === 10 ? "K" : String(r);
  return { filas: filas.reverse(), suma, resto, r, dv };
}

function validarRut(valor) {
  const c = limpiar(valor);
  if (c.length < 2) return { estado: "vacio" };
  const cuerpo = c.slice(0, -1);
  const dvIngresado = c.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return { estado: "formato", msg: "La letra K solo puede ir como dígito verificador." };
  if (cuerpo.length < 7) return { estado: "formato", msg: "El cuerpo del RUT debe tener al menos 7 dígitos." };
  const calc = calcularDV(cuerpo);
  return { estado: calc.dv === dvIngresado ? "valido" : "invalido", cuerpo, dvIngresado, ...calc };
}

function render() {
  const res = validarRut(input.value);
  const st = $("status");
  st.className = "status";
  input.classList.remove("ok", "bad");

  if (res.estado === "vacio") {
    $("pill").textContent = "—";
    $("msg").textContent = "Ingresa un RUT";
  } else if (res.estado === "formato") {
    st.classList.add("bad"); input.classList.add("bad");
    $("pill").textContent = "Formato";
    $("msg").textContent = res.msg;
  } else if (res.estado === "valido") {
    st.classList.add("ok"); input.classList.add("ok");
    $("pill").textContent = "Válido";
    $("msg").textContent = `El dígito verificador ${res.dv} es correcto.`;
  } else {
    st.classList.add("bad"); input.classList.add("bad");
    $("pill").textContent = "Inválido";
    $("msg").textContent = `El DV ingresado es ${res.dvIngresado}, pero debería ser ${res.dv}.`;
  }

  const table = $("table");
  const steps = $("steps");
  if (!res.filas) {
    table.innerHTML = '<tr><td>Escribe un RUT de 7 u 8 dígitos para ver el cálculo.</td></tr>';
    steps.innerHTML = "";
    return;
  }
  const fila = (cls, label, vals) =>
    `<tr class="${cls}"><td>${label}</td>${vals.map(v => `<td>${v}</td>`).join("")}</tr>`;
  table.innerHTML =
    fila("digits", "Dígito", res.filas.map(x => x.d)) +
    fila("factors", "× Factor", res.filas.map(x => x.f)) +
    fila("products", "= Producto", res.filas.map(x => x.p));

  const reglaDV = res.r === 11 ? "11 → 0" : res.r === 10 ? "10 → K" : String(res.r);
  steps.innerHTML = `
    <li><span class="k">Suma de productos</span><span class="v">${res.filas.map(x => x.p).join(" + ")} = ${res.suma}</span></li>
    <li><span class="k">Resto de ${res.suma} ÷ 11</span><span class="v">${res.resto}</span></li>
    <li><span class="k">11 − ${res.resto}</span><span class="v">${reglaDV}</span></li>
    <li class="final"><span class="k">Dígito verificador</span><span class="v">${res.dv}</span></li>`;
}

input.addEventListener("input", () => {
  const pos = input.value.length - input.selectionStart;
  input.value = formatear(input.value);
  const nueva = Math.max(0, input.value.length - pos);
  input.setSelectionRange(nueva, nueva);
  render();
});
$("form").addEventListener("submit", (e) => e.preventDefault());
$("clear").addEventListener("click", () => { input.value = ""; render(); input.focus(); });
document.querySelectorAll(".chip").forEach(b =>
  b.addEventListener("click", () => { input.value = b.dataset.rut; render(); })
);
render();
