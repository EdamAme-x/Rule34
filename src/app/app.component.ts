import { Component, OnInit } from "@angular/core";
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from "@angular/platform-browser";
import { randomInt } from "./utils/randomInt";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "rule34";
  imageUrl: Element | any = "";
  id = "";
  image: SafeHtml = "";
  reloadInterval: number = 5000;

  changeInterval(event: Event) {
    this.reloadInterval = parseInt((event.target as HTMLInputElement).value);
    localStorage.setItem("reloadInterval", this.reloadInterval.toString());
  }

  ngOnInit() {
    this.id = randomInt(1, 8000000).toString();
    if (typeof window == "undefined") return;

    if (!localStorage.getItem("reloadInterval")) {
      localStorage.setItem("reloadInterval", "5000");
    }

    fetch("/image/" + this.id)
      .then((res) => res.text())
      .then(async (text) => {
        try {
          const dom = new DOMParser()
            .parseFromString(text, "text/html")
            .querySelectorAll("img#image")[0];

          console.log(dom);

          this.imageUrl = dom;
        } catch (_e) {}

        try {
          this.imageUrl.getAttribute("src");
        } catch (_e) {
          window.location.reload();
        }

        const resp = await fetch(
          "/get-image/" + this.imageUrl.getAttribute("src")
        );

        const imageBlob = await resp.blob(); // .blob()
        const imageURL = URL.createObjectURL(imageBlob);
        console.log(imageURL);

        try {
          this.image = this.sanitizer.bypassSecurityTrustHtml(
            `
            <a href="${this.imageUrl.getAttribute("src")}" target="_blank">
            ${
              this.imageUrl.outerHTML
                ? this.imageUrl.getAttribute("src").split("//")[2] // path
                : ""
            }
            </a>
            <img id="image" src="${imageURL}">`
          );
        } catch (_e) {
          window.location.reload();
        }

        setTimeout(() => {
          this.ngOnInit();
        }, this.reloadInterval);
      });
  }

  constructor(private sanitizer: DomSanitizer) {}
}
